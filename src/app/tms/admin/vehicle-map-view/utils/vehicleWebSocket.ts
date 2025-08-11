// utils/vehicleWebSocket.ts
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

interface VehicleLocationUpdate {
  vehicleId: string;
  vehicleType: string;
  plateNumber: string;
  driverName: string;
  vehicleModel: string;
  vehicleStatus: string;
  latitude: number;
  longitude: number;
  speed: number;
  heading: number;
  timestamp: string;
  deviceImei: string;
}

interface GpsData {
  imei: string;
  latitude: number;
  longitude: number;
  speed: number;
  heading: number;
  timestamp: string;
}

type VehicleUpdateCallback = (update: VehicleLocationUpdate) => void;
type ConnectionStatusCallback = (isConnected: boolean) => void;

class VehicleWebSocket {
  private client: Client;
  private callbacks: VehicleUpdateCallback[] = [];
  private statusCallbacks: ConnectionStatusCallback[] = [];
  private _isConnected: boolean = false;
  private static instance: VehicleWebSocket;
  private connectionAttempts: number = 0;
  private maxConnectionAttempts: number = 5;
  private reconnectDelay: number = 5000;

  private constructor() {
    this.client = new Client({
      webSocketFactory: () => new SockJS(`${process.env.NEXT_PUBLIC_API_BASE_URL}/ws-vehicle-updates`),
      reconnectDelay: this.reconnectDelay,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: (str) => console.debug('[WebSocket]', str),
      connectionTimeout: 10000,
      beforeConnect: () => {
        console.log('Attempting to connect...');
      },
      onConnect: (frame) => {
        this.connectionAttempts = 0;
        this.setConnected(true);
        console.log('WebSocket connected successfully');
        
        this.client.subscribe('/topic/vehicle-updates', (message: IMessage) => {
          try {
            const update: VehicleLocationUpdate = JSON.parse(message.body);
            this.callbacks.forEach(cb => cb(update));
          } catch (err) {
            console.error('Error processing WebSocket message:', err);
          }
        });
      },
      onDisconnect: () => {
        this.setConnected(false);
        console.log('WebSocket disconnected');
      },
      onStompError: (frame) => {
        console.error('STOMP protocol error:', frame.headers.message);
        this.setConnected(false);
        this.handleConnectionFailure();
      },
      onWebSocketError: (event) => {
        console.error('WebSocket connection error:', event);
        this.setConnected(false);
        this.handleConnectionFailure();
      },
      onWebSocketClose: (event) => {
        console.log('WebSocket closed:', event);
        this.setConnected(false);
      }
    });
  }

  private handleConnectionFailure() {
    this.connectionAttempts++;
    if (this.connectionAttempts >= this.maxConnectionAttempts) {
      console.error(`Max connection attempts (${this.maxConnectionAttempts}) reached`);
      this.client.deactivate().then(() => {
        console.log('WebSocket client deactivated');
      });
    } else {
      console.log(`Retrying connection (attempt ${this.connectionAttempts})...`);
    }
  }

  public static getInstance(): VehicleWebSocket {
    if (!VehicleWebSocket.instance) {
      VehicleWebSocket.instance = new VehicleWebSocket();
    }
    return VehicleWebSocket.instance;
  }

  private setConnected(status: boolean) {
    if (this._isConnected !== status) {
      this._isConnected = status;
      this.statusCallbacks.forEach(cb => cb(status));
    }
  }

  public connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.client.active) {
        this.connectionAttempts = 0;
        this.client.onConnect = (frame) => {
          this.setConnected(true);
          resolve();
        };
        this.client.onStompError = (frame) => {
          reject(new Error(frame.headers.message));
        };
        this.client.activate();
      } else {
        resolve();
      }
    });
  }

  public disconnect(): Promise<void> {
    return new Promise((resolve) => {
      if (this.client.active) {
        this.client.deactivate().then(() => {
          this.setConnected(false);
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  public getConnectionStatus(): boolean {
    return this._isConnected;
  }

  public subscribe(callback: VehicleUpdateCallback): () => void {
    this.callbacks.push(callback);
    return () => {
      this.callbacks = this.callbacks.filter(cb => cb !== callback);
    };
  }

  public subscribeToStatus(callback: ConnectionStatusCallback): () => void {
    this.statusCallbacks.push(callback);
    callback(this._isConnected);
    return () => {
      this.statusCallbacks = this.statusCallbacks.filter(cb => cb !== callback);
    };
  }

  public sendGpsData(data: GpsData): Promise<boolean> {
    return new Promise((resolve) => {
      if (this._isConnected && this.client) {
        try {
          this.client.publish({
            destination: '/app/vehicle-gps',
            body: JSON.stringify(data),
            headers: { 'content-type': 'application/json' }
          });
          resolve(true);
        } catch (err) {
          console.error('Error sending GPS data:', err);
          resolve(false);
        }
      } else {
        console.warn('WebSocket not connected, cannot send GPS data');
        resolve(false);
      }
    });
  }
}

export const vehicleWebSocket = VehicleWebSocket.getInstance();
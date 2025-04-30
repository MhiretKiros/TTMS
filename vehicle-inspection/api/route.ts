import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const {
      plate_number,
      inspection_date = new Date(),
      notes,
      // Mechanical components
      engine_condition,
      engine_power,
      suspension,
      brakes,
      steering,
      gearbox,
      mileage,
      fuel_gauge,
      temp_gauge,
      oil_gauge,
      battery_status,
      // Body components
      body_collision_problem,
      body_collision_severity,
      body_collision_notes,
      body_scratches_problem,
      body_scratches_severity,
      body_scratches_notes,
      breakages_problem,
      breakages_severity,
      breakages_notes,
      cracks_problem,
      cracks_severity,
      cracks_notes,
      paint_condition_problem,
      paint_condition_severity,
      paint_condition_notes,
      // Interior components
      brake_light,
      car_ignition,
      car_tab,
      charging_indicator,
      clock,
      dashboard_decoration,
      door_lock,
      engine_exhaust,
      floor_mat,
      fuel_consumption,
      full_insurance,
      headlights,
      interior_roof,
      license_plate_light,
      mirror_adjustment,
      rain_wiper,
      rear_view_mirror,
      rpm,
      seat_belt,
      seat_comfort,
      seat_fabric,
      sunshade,
      turn_signal_light,
      ventilation_system,
      window_curtain,
      // Status
      status
    } = await request.json();

    const inspection = await prisma.inspection.create({
      data: {
        plate_number,
        inspection_date: new Date(inspection_date),
        notes,
        // Mechanical
        engine_condition,
        engine_power,
        suspension,
        brakes,
        steering,
        gearbox,
        mileage,
        fuel_gauge,
        temp_gauge,
        oil_gauge,
        battery_status,
        // Body
        body_collision_problem,
        body_collision_severity,
        body_collision_notes,
        body_scratches_problem,
        body_scratches_severity,
        body_scratches_notes,
        breakages_problem,
        breakages_severity,
        breakages_notes,
        cracks_problem,
        cracks_severity,
        cracks_notes,
        paint_condition_problem,
        paint_condition_severity,
        paint_condition_notes,
        // Interior
        brake_light,
        car_ignition,
        car_tab,
        charging_indicator,
        clock,
        dashboard_decoration,
        door_lock,
        engine_exhaust,
        floor_mat,
        fuel_consumption,
        full_insurance,
        headlights,
        interior_roof,
        license_plate_light,
        mirror_adjustment,
        rain_wiper,
        rear_view_mirror,
        rpm,
        seat_belt,
        seat_comfort,
        seat_fabric,
        sunshade,
        turn_signal_light,
        ventilation_system,
        window_curtain,
        // Status
        status
      }
    });

    return NextResponse.json(inspection, { status: 201 });
  } catch (error) {
    console.error('Error creating inspection:', error);
    return NextResponse.json(
      { error: 'Failed to create inspection record' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const inspections = await prisma.inspection.findMany({
      orderBy: { inspection_date: 'desc' }
    });
    return NextResponse.json(inspections);
  } catch (error) {
    console.error('Error fetching inspections:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inspections' },
      { status: 500 }
    );
  }
}
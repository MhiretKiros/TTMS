package com.amlakie.usermanagment.entity.organization;

import jakarta.persistence.*;
import lombok.Getter; // Using specific Lombok annotations
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.ToString;
import lombok.EqualsAndHashCode;

@Entity
@Getter // Explicitly add Getter
@Setter // Explicitly add Setter
@NoArgsConstructor
@ToString(exclude = {"organizationCarInspection"}) // Exclude relational fields from default toString
@EqualsAndHashCode(exclude = {"organizationCarInspection"}) // Exclude relational fields from default equals/hashCode
public class OrganizationInteriorInspection {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // For all OrganizationItemCondition fields, consider adding JoinColumn for explicitness
    // and FetchType.LAZY if they are not always needed when loading OrganizationInteriorInspection.

    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JoinColumn(name = "engine_exhaust_condition_id") // Example explicit join column
    private OrganizationItemCondition engineExhaust;

    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JoinColumn(name = "seat_comfort_condition_id")
    private OrganizationItemCondition seatComfort;

    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JoinColumn(name = "seat_fabric_condition_id")
    private OrganizationItemCondition seatFabric;

    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JoinColumn(name = "floor_mat_condition_id")
    private OrganizationItemCondition floorMat;

    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JoinColumn(name = "rear_view_mirror_condition_id")
    private OrganizationItemCondition rearViewMirror;

    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JoinColumn(name = "car_tab_condition_id")
    private OrganizationItemCondition carTab;

    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JoinColumn(name = "mirror_adjustment_condition_id")
    private OrganizationItemCondition mirrorAdjustment;

    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JoinColumn(name = "door_lock_condition_id")
    private OrganizationItemCondition doorLock;

    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JoinColumn(name = "ventilation_system_condition_id")
    private OrganizationItemCondition ventilationSystem;

    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JoinColumn(name = "dashboard_decoration_condition_id")
    private OrganizationItemCondition dashboardDecoration;

    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JoinColumn(name = "seat_belt_condition_id")
    private OrganizationItemCondition seatBelt;

    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JoinColumn(name = "sunshade_condition_id")
    private OrganizationItemCondition sunshade;

    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JoinColumn(name = "window_curtain_condition_id")
    private OrganizationItemCondition windowCurtain;

    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JoinColumn(name = "interior_roof_condition_id")
    private OrganizationItemCondition interiorRoof;

    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JoinColumn(name = "car_ignition_condition_id")
    private OrganizationItemCondition carIgnition;

    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JoinColumn(name = "fuel_consumption_condition_id")
    private OrganizationItemCondition fuelConsumption;

    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JoinColumn(name = "headlights_condition_id")
    private OrganizationItemCondition headlights;

    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JoinColumn(name = "rain_wiper_condition_id")
    private OrganizationItemCondition rainWiper;

    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JoinColumn(name = "turn_signal_light_condition_id")
    private OrganizationItemCondition turnSignalLight;

    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JoinColumn(name = "brake_light_condition_id")
    private OrganizationItemCondition brakeLight;

    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JoinColumn(name = "license_plate_light_condition_id")
    private OrganizationItemCondition licensePlateLight;

    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JoinColumn(name = "clock_condition_id")
    private OrganizationItemCondition clock;

    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JoinColumn(name = "rpm_condition_id")
    private OrganizationItemCondition rpm;

    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JoinColumn(name = "battery_status_condition_id")
    private OrganizationItemCondition batteryStatus;

    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JoinColumn(name = "charging_indicator_condition_id")
    private OrganizationItemCondition chargingIndicator;

    // This is the inverse side of the @OneToOne relationship
    // 'interiorDetails' should be the field name in the OrganizationCarInspection entity
    @OneToOne(mappedBy = "interiorDetails", fetch = FetchType.LAZY)
    private OrganizationCarInspection organizationCarInspection; // Corrected field name
}
package com.amlakie.usermanagment.entity;

import com.amlakie.usermanagment.entity.organization.OrganizationInteriorInspection;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
public class InteriorInspection  {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(cascade = CascadeType.ALL)
    private ItemCondition engineExhaust;

    @OneToOne(cascade = CascadeType.ALL)
    private ItemCondition seatComfort;

    @OneToOne(cascade = CascadeType.ALL)
    private ItemCondition seatFabric;

    @OneToOne(cascade = CascadeType.ALL)
    private ItemCondition floorMat;

    @OneToOne(cascade = CascadeType.ALL)
    private ItemCondition rearViewMirror;

    @OneToOne(cascade = CascadeType.ALL)
    private ItemCondition carTab;

    @OneToOne(cascade = CascadeType.ALL)
    private ItemCondition mirrorAdjustment;

    @OneToOne(cascade = CascadeType.ALL)
    private ItemCondition doorLock;

    @OneToOne(cascade = CascadeType.ALL)
    private ItemCondition ventilationSystem;

    @OneToOne(cascade = CascadeType.ALL)
    private ItemCondition dashboardDecoration;

    @OneToOne(cascade = CascadeType.ALL)
    private ItemCondition seatBelt;

    @OneToOne(cascade = CascadeType.ALL)
    private ItemCondition sunshade;

    @OneToOne(cascade = CascadeType.ALL)
    private ItemCondition windowCurtain;

    @OneToOne(cascade = CascadeType.ALL)
    private ItemCondition interiorRoof;

    @OneToOne(cascade = CascadeType.ALL)
    private ItemCondition carIgnition;

    @OneToOne(cascade = CascadeType.ALL)
    private ItemCondition fuelConsumption;

    @OneToOne(cascade = CascadeType.ALL)
    private ItemCondition headlights;

    @OneToOne(cascade = CascadeType.ALL)
    private ItemCondition rainWiper;

    @OneToOne(cascade = CascadeType.ALL)
    private ItemCondition turnSignalLight;

    @OneToOne(cascade = CascadeType.ALL)
    private ItemCondition brakeLight;

    @OneToOne(cascade = CascadeType.ALL)
    private ItemCondition licensePlateLight;

    @OneToOne(cascade = CascadeType.ALL)
    private ItemCondition clock;

    @OneToOne(cascade = CascadeType.ALL)
    private ItemCondition rpm;

    @OneToOne(cascade = CascadeType.ALL)
    private ItemCondition batteryStatus;

    @OneToOne(cascade = CascadeType.ALL)
    private ItemCondition chargingIndicator;

    @OneToOne(mappedBy = "interior", fetch = FetchType.LAZY) // 'mappedBy' refers to the field name in CarInspection
    private CarInspection carInspection;
}
package com.amlakie.usermanagment.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class InteriorInspectionDTO  {

    // Add messages for better error feedback
    @NotNull(message = "Engine exhaust details required") @Valid
    private ItemConditionDTO engineExhaust = new ItemConditionDTO();

    @NotNull(message = "Seat comfort details required") @Valid
    private ItemConditionDTO seatComfort = new ItemConditionDTO();

    @NotNull(message = "Seat fabric details required") @Valid
    private ItemConditionDTO seatFabric = new ItemConditionDTO();

    @NotNull(message = "Floor mat details required") @Valid
    private ItemConditionDTO floorMat = new ItemConditionDTO();

    @NotNull(message = "Rear view mirror details required") @Valid
    private ItemConditionDTO rearViewMirror = new ItemConditionDTO();

    @NotNull(message = "Car tab details required") @Valid
    private ItemConditionDTO carTab = new ItemConditionDTO();

    @NotNull(message = "Mirror adjustment details required") @Valid
    private ItemConditionDTO mirrorAdjustment = new ItemConditionDTO();

    @NotNull(message = "Door lock details required") @Valid
    private ItemConditionDTO doorLock = new ItemConditionDTO();

    @NotNull(message = "Ventilation system details required") @Valid
    private ItemConditionDTO ventilationSystem = new ItemConditionDTO();

    @NotNull(message = "Dashboard decoration details required") @Valid
    private ItemConditionDTO dashboardDecoration = new ItemConditionDTO();

    @NotNull(message = "Seat belt details required") @Valid
    private ItemConditionDTO seatBelt = new ItemConditionDTO();

    @NotNull(message = "Sunshade details required") @Valid
    private ItemConditionDTO sunshade = new ItemConditionDTO();

    @NotNull(message = "Window curtain details required") @Valid
    private ItemConditionDTO windowCurtain = new ItemConditionDTO();

    @NotNull(message = "Interior roof details required") @Valid
    private ItemConditionDTO interiorRoof = new ItemConditionDTO();

    @NotNull(message = "Car ignition details required") @Valid
    private ItemConditionDTO carIgnition = new ItemConditionDTO();

    @NotNull(message = "Fuel consumption details required") @Valid
    private ItemConditionDTO fuelConsumption = new ItemConditionDTO();

    @NotNull(message = "Headlights details required") @Valid
    private ItemConditionDTO headlights = new ItemConditionDTO();

    @NotNull(message = "Rain wiper details required") @Valid
    private ItemConditionDTO rainWiper = new ItemConditionDTO();

    @NotNull(message = "Turn signal light details required") @Valid
    private ItemConditionDTO turnSignalLight = new ItemConditionDTO();

    @NotNull(message = "Brake light details required") @Valid
    private ItemConditionDTO brakeLight = new ItemConditionDTO();

    @NotNull(message = "License plate light details required") @Valid
    private ItemConditionDTO licensePlateLight = new ItemConditionDTO();

    @NotNull(message = "Clock details required") @Valid
    private ItemConditionDTO clock = new ItemConditionDTO();

    @NotNull(message = "RPM details required") @Valid
    private ItemConditionDTO rpm = new ItemConditionDTO();

    @NotNull(message = "Battery status details required") @Valid
    private ItemConditionDTO batteryStatus = new ItemConditionDTO();

    @NotNull(message = "Charging indicator details required") @Valid
    private ItemConditionDTO chargingIndicator = new ItemConditionDTO();
}
package com.amlakie.usermanagment.entity.organization.enums; // Or your preferred package

public enum ServiceStatusType {
    Pending, // Often an initial or undetermined state
    Ready,
    Ready_With_Warning,
    Not_ready,
    IN_SERVICE,         // Could be an alternative or synonym for READY
    OUT_OF_SERVICE,
    PENDING_MAINTENANCE
    // Add any other statuses relevant to the service lifecycle of the car
}
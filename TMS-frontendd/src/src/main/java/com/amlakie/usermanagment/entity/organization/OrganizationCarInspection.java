package com.amlakie.usermanagment.entity.organization;

import com.amlakie.usermanagment.entity.OrganizationCar;
import com.amlakie.usermanagment.entity.organization.enums.InspectionStatusType;
import com.amlakie.usermanagment.entity.organization.enums.ServiceStatusType;
import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "org_car_inspections")
@Getter
@Setter
@NoArgsConstructor // Good practice for JPA entities
@ToString(exclude = {"mechanicalDetails", "bodyDetails", "interiorDetails", "organizationCar"}) // Exclude lazy-loaded fields
@EqualsAndHashCode(of = "id") // Base equals/hashCode on ID only
public class OrganizationCarInspection {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String inspectorName;

    @Column(nullable = false, updatable = false)
    @CreationTimestamp // Automatically set by Hibernate on creation
    private LocalDateTime inspectionDate;

    @Enumerated(EnumType.STRING) // Using Enum for type safety
    @Column(nullable = false) // Assuming status is always required
    private InspectionStatusType inspectionStatus;

    @Enumerated(EnumType.STRING) // Using Enum for type safety
    @Column(nullable = false) // Assuming status is always required
    private ServiceStatusType serviceStatus;

    private Integer bodyScore;
    private Integer interiorScore;

    @Column(columnDefinition = "TEXT")
    private String notes;

    // Example in OrganizationCarInspection.java
    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER) // Or LAZY if handled carefully
    @JoinColumn(name = "mechanical_id", referencedColumnName = "id")
    private OrganizationMechanicalInspection mechanicalDetails;

    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JoinColumn(name = "body_id", referencedColumnName = "id")
    private OrganizationBodyInspection bodyDetails;

    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JoinColumn(name = "interior_id", referencedColumnName = "id")
    private OrganizationInteriorInspection interiorDetails;

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonBackReference // This side will NOT be serialized, breaking the loop
    @JoinColumn(name = "car_id", referencedColumnName = "id", nullable = false)
    private OrganizationCar organizationCar;

    @PrePersist
    @PreUpdate
    private void setBackReferences() {
        if (mechanicalDetails != null) {
            mechanicalDetails.setOrgCarInspection(this);
        }
        if (bodyDetails != null) {
            bodyDetails.setOrgCarInspection(this);
        }
        if (interiorDetails != null) {
            interiorDetails.setOrgCarInspection(this);
        }
    }

    // --- Enums for Statuses ---
    // These can be defined as top-level enums in their own files for better organization
    // or as public static nested enums if preferred for very close coupling.
    // For clarity and reusability, separate files are often better.

    // Example: (Assuming these are defined in their own files or as public static nested enums)
    // public enum InspectionStatusType {
    //     PENDING, APPROVED, REJECTED, CONDITIONALLY_APPROVED
    // }
    //
    // public enum ServiceStatusType {
    //     READY, PENDING_MAINTENANCE, OUT_OF_SERVICE, READY_WITH_WARNING // Added from your DTO
    // }
}
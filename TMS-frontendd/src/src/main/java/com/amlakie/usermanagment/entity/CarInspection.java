package com.amlakie.usermanagment.entity;

import jakarta.persistence.*;
import lombok.Data; // Consider replacing with @Getter, @Setter, @EqualsAndHashCode(of = "id") for safety
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "car_inspections")
// Using individual annotations is often safer for JPA entities than @Data
@Getter
@Setter
@EqualsAndHashCode(of = "id") // Base equals/hashCode on ID only
public class CarInspection {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String inspectorName;

    // --- REMOVE THIS LINE ---
    // private String plateNumber;
    // --- END REMOVAL ---

    // Consider if default value is truly desired here, or should be set in service
    @Column(nullable = false)
    private LocalDateTime inspectionDate = LocalDateTime.now();

    // Consider using @Enumerated(EnumType.STRING) if these map to enums
    private String inspectionStatus;
    private String serviceStatus;

    private Integer bodyScore;
    private Integer interiorScore;

    @Column(columnDefinition = "TEXT") // Good for potentially long notes
    private String notes;

    // Assuming MechanicalInspection etc. are separate tables and CarInspection owns the FK
    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JoinColumn(name = "mechanical_id", referencedColumnName = "id") // Define the join column
    private MechanicalInspection mechanical;

    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JoinColumn(name = "body_id", referencedColumnName = "id") // Define the join column
    private BodyInspection body;

    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JoinColumn(name = "interior_id", referencedColumnName = "id") // Define the join column
    private InteriorInspection interior;

    @ManyToOne(fetch = FetchType.LAZY) // LAZY is often preferred for performance
    @JoinColumn(name = "car_id", referencedColumnName = "id", nullable = false) // Join on car's primary key
    private Car car;

    // Optional: Helper method to ensure bidirectional links are set before persisting/updating
    // This helps if you save CarInspection and expect nested entities to be saved with the link
    @PrePersist
    @PreUpdate
    private void setBackReferences() {
        if (mechanical != null) {
            mechanical.setCarInspection(this);
        }
        if (body != null) {
            body.setCarInspection(this);
        }
        if (interior != null) {
            interior.setCarInspection(this);
        }
    }
}
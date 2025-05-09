package com.amlakie.usermanagment.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Traveler {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @ManyToOne
    @JoinColumn(name = "travel_request_id")
    @JsonBackReference  // Prevent infinite recursion by managing the reference back to TravelRequest
    private TravelRequest travelRequest;
}

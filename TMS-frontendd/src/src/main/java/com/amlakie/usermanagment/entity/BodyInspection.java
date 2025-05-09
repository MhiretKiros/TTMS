package com.amlakie.usermanagment.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
public class BodyInspection {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(cascade = CascadeType.ALL)
    private ItemCondition bodyCollision;

    @OneToOne(cascade = CascadeType.ALL)
    private ItemCondition bodyScratches;

    @OneToOne(cascade = CascadeType.ALL)
    private ItemCondition paintCondition;

    @OneToOne(cascade = CascadeType.ALL)
    private ItemCondition breakages;

    @OneToOne(cascade = CascadeType.ALL)
    private ItemCondition cracks;

    @OneToOne(mappedBy = "body", fetch = FetchType.LAZY) // 'mappedBy' refers to the field name in CarInspection
    private CarInspection carInspection;
}
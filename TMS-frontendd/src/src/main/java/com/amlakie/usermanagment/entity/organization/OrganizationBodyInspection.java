package com.amlakie.usermanagment.entity.organization;

import com.amlakie.usermanagment.entity.BodyInspection;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
public class OrganizationBodyInspection  {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(cascade = CascadeType.ALL)
    private OrganizationItemCondition bodyCollision;

    @OneToOne(cascade = CascadeType.ALL)
    private OrganizationItemCondition bodyScratches;

    @OneToOne(cascade = CascadeType.ALL)
    private OrganizationItemCondition paintCondition;

    @OneToOne(cascade = CascadeType.ALL)
    private OrganizationItemCondition breakages;

    @OneToOne(cascade = CascadeType.ALL)
    private OrganizationItemCondition cracks;

    @OneToOne(mappedBy = "bodyDetails", fetch = FetchType.LAZY) // 'mappedBy' refers to the field name in CarInspection
    private OrganizationCarInspection orgCarInspection;
}
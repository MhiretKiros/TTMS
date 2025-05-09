package com.amlakie.usermanagment.entity;

import jakarta.persistence.*;
import lombok.Data;

@Embeddable
@Data
public class BodyCondition {
    @AttributeOverrides({
            @AttributeOverride(name = "problem", column = @Column(name = "body_collision_problem")),
            @AttributeOverride(name = "severity", column = @Column(name = "body_collision_severity")),
            @AttributeOverride(name = "notes", column = @Column(name = "body_collision_notes"))
    })
    private BodyProblem bodyCollision;

    @AttributeOverrides({
            @AttributeOverride(name = "problem", column = @Column(name = "body_scratches_problem")),
            @AttributeOverride(name = "severity", column = @Column(name = "body_scratches_severity")),
            @AttributeOverride(name = "notes", column = @Column(name = "body_scratches_notes"))
    })
    private BodyProblem bodyScratches;

    // Similarly for other BodyProblem fields...
    @AttributeOverrides({
            @AttributeOverride(name = "problem", column = @Column(name = "paint_condition_problem")),
            @AttributeOverride(name = "severity", column = @Column(name = "paint_condition_severity")),
            @AttributeOverride(name = "notes", column = @Column(name = "paint_condition_notes"))
    })
    private BodyProblem paintCondition;

    @AttributeOverrides({
            @AttributeOverride(name = "problem", column = @Column(name = "breakages_problem")),
            @AttributeOverride(name = "severity", column = @Column(name = "breakages_severity")),
            @AttributeOverride(name = "notes", column = @Column(name = "breakages_notes"))
    })
    private BodyProblem breakages;

    @AttributeOverrides({
            @AttributeOverride(name = "problem", column = @Column(name = "cracks_problem")),
            @AttributeOverride(name = "severity", column = @Column(name = "cracks_severity")),
            @AttributeOverride(name = "notes", column = @Column(name = "cracks_notes"))
    })
    private BodyProblem cracks;
}
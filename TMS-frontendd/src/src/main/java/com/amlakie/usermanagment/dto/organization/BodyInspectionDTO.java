package com.amlakie.usermanagment.dto.organization; // Adjust package name if needed

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NoArgsConstructor;

// Assuming ItemConditionDTO is similar to your previous BodyProblemDTO

@Data
@NoArgsConstructor
public class BodyInspectionDTO {
    @NotNull(message = "Body collision details are required")
    @Valid // Correct: Enables validation of fields within ItemConditionDTO
    private ItemConditionDTO bodyCollision = new ItemConditionDTO();

    @NotNull(message = "Body scratches details are required") // Added message
    @Valid
    private ItemConditionDTO bodyScratches = new ItemConditionDTO();

    @NotNull(message = "Paint condition details are required") // Added message
    @Valid
    private ItemConditionDTO paintCondition = new ItemConditionDTO();

    @NotNull(message = "Breakages details are required") // Added message
    @Valid
    private ItemConditionDTO breakages = new ItemConditionDTO();

    @NotNull(message = "Cracks details are required") // Added message
    @Valid
    private ItemConditionDTO cracks = new ItemConditionDTO(); // Initialized directly
}
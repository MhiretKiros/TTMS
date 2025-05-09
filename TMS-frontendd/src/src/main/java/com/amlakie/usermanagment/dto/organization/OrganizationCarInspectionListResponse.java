package com.amlakie.usermanagment.dto.organization;

import com.amlakie.usermanagment.dto.CarInspectionReqRes;
import com.fasterxml.jackson.annotation.JsonInclude; // For controlling JSON output
import lombok.Data;
import lombok.NoArgsConstructor; // Good practice to include
import java.util.List;
import java.util.ArrayList; // Good for initializing lists

@Data
@NoArgsConstructor // Useful for deserialization and frameworks
@JsonInclude(JsonInclude.Include.NON_NULL) // Omits null fields from JSON output
public class OrganizationCarInspectionListResponse {
    private int codStatus;
    private String message;
    private String error;
    private List<OrganizationCarInspectionReqRes> inspections;
}
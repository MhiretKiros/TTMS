package com.amlakie.usermanagment.dto;

import lombok.Data;
import java.util.List;

@Data
public class CarInspectionListResponse {
    private int codStatus;
    private String message;
    private String error;
    private List<CarInspectionReqRes> inspections;
}
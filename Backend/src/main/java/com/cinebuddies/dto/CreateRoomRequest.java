package com.cinebuddies.dto;

import com.cinebuddies.model.ContentType;
import java.util.List;

public record CreateRoomRequest(
    String name,
    List<ContentType> contentTypes,
    String hostName
) {}


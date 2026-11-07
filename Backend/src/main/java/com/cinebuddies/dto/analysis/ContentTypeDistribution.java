package com.cinebuddies.dto.analysis;

import com.cinebuddies.model.ContentType;

public record ContentTypeDistribution(
    ContentType type,
    int count
) {}


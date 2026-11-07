package com.cinebuddies.controller;

import com.cinebuddies.dto.CreateRoomRequest;
import com.cinebuddies.dto.JoinRoomRequest;
import com.cinebuddies.dto.RoomResponse;
import com.cinebuddies.service.RoomService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/rooms")
@CrossOrigin(origins = "*")
public class RoomController {

    private final RoomService roomService;

    public RoomController(RoomService roomService) {
        this.roomService = roomService;
    }

    @PostMapping
    public ResponseEntity<RoomResponse> createRoom(@RequestBody CreateRoomRequest request) {
        RoomResponse response = roomService.createRoom(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/{code}/join")
    public ResponseEntity<RoomResponse> joinRoom(
            @PathVariable("code") String code,
            @RequestBody JoinRoomRequest request) {
        RoomResponse response = roomService.joinRoom(code, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{code}")
    public ResponseEntity<RoomResponse> getRoom(@PathVariable("code") String code) {
        RoomResponse response = roomService.getRoom(code);
        return ResponseEntity.ok(response);
    }
}


package com.cinebuddies.controller;

import com.cinebuddies.dto.voting.FinalizeRequest;
import com.cinebuddies.dto.voting.VoteRequest;
import com.cinebuddies.dto.voting.VoteResponse;
import com.cinebuddies.service.VotingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/rooms/{code}")
@CrossOrigin(origins = "*")
public class VotingController {

    private final VotingService votingService;

    public VotingController(VotingService votingService) {
        this.votingService = votingService;
    }

    @PostMapping("/members/{memberId}/votes")
    public ResponseEntity<VoteResponse> castVote(
            @PathVariable("code") String code,
            @PathVariable("memberId") UUID memberId,
            @RequestBody VoteRequest request
    ) {
        VoteResponse response = votingService.castVote(code, memberId, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/votes")
    public ResponseEntity<List<VoteResponse>> getVotes(@PathVariable("code") String code) {
        List<VoteResponse> votes = votingService.getVotes(code);
        return ResponseEntity.ok(votes);
    }

    @PostMapping("/finalize")
    public ResponseEntity<Map<String, String>> finalizeVoting(
            @PathVariable("code") String code,
            @RequestParam("hostId") UUID hostId,
            @RequestBody FinalizeRequest request
    ) {
        votingService.finalizeVoting(code, hostId, request);
        return ResponseEntity.ok(Map.of("message", "Voting finalized successfully for room " + code));
    }
}


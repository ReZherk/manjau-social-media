package com.manjau.socialmedia.role.controller;

import com.manjau.socialmedia.role.dto.RoleResponse;
import com.manjau.socialmedia.role.service.RoleService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/roles")
public class RoleController {

    private final RoleService roleService;

    public RoleController(RoleService roleService) {
        this.roleService = roleService;
    }

    @GetMapping("/assignable")
    public ResponseEntity<List<RoleResponse>> getAssignableRoles() {
        return ResponseEntity.ok(roleService.getAssignableRoles());
    }
}

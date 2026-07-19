package com.manjau.socialmedia.role.service;

import com.manjau.socialmedia.role.dto.RoleResponse;
import com.manjau.socialmedia.role.entity.Role;
import com.manjau.socialmedia.role.repository.RoleRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RoleService {

    private final RoleRepository roleRepository;

    public RoleService(RoleRepository roleRepository) {
        this.roleRepository = roleRepository;
    }

    public List<RoleResponse> getAssignableRoles() {
        return roleRepository.findAll().stream()
                .filter(r -> !"ADMINISTRATOR".equals(r.getCode()))
                .map(this::toResponse)
                .toList();
    }

    private RoleResponse toResponse(Role role) {
        RoleResponse r = new RoleResponse();
        r.setId(role.getId());
        r.setCode(role.getCode());
        r.setName(role.getName());
        return r;
    }
}

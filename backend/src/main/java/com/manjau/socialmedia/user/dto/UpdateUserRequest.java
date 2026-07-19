package com.manjau.socialmedia.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class UpdateUserRequest {
    @NotBlank(message = "Los nombres son obligatorios")
    private String firstName;

    @NotBlank(message = "El apellido paterno es obligatorio")
    private String paternalSurname;

    @NotBlank(message = "El apellido materno es obligatorio")
    private String maternalSurname;

    @NotBlank(message = "El correo institucional es obligatorio")
    @Email(message = "El correo no es válido")
    private String institutionalEmail;

    @NotBlank(message = "El rol es obligatorio")
    private String roleCode;

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    public String getPaternalSurname() { return paternalSurname; }
    public void setPaternalSurname(String paternalSurname) { this.paternalSurname = paternalSurname; }
    public String getMaternalSurname() { return maternalSurname; }
    public void setMaternalSurname(String maternalSurname) { this.maternalSurname = maternalSurname; }
    public String getInstitutionalEmail() { return institutionalEmail; }
    public void setInstitutionalEmail(String institutionalEmail) { this.institutionalEmail = institutionalEmail.toLowerCase(); }
    public String getRoleCode() { return roleCode; }
    public void setRoleCode(String roleCode) { this.roleCode = roleCode; }
}

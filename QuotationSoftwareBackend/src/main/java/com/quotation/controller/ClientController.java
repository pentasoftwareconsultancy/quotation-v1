package com.quotation.controller;

import com.quotation.model.Client;
import com.quotation.repository.ClientRepository;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/clients")
@CrossOrigin(origins = "http://localhost:5173")
public class ClientController {

    private final ClientRepository clientRepository;

    public ClientController(ClientRepository clientRepository) {
        this.clientRepository = clientRepository;
    }

    // ✅ 1. GET ALL CLIENTS
    @GetMapping
    public List<Client> getAllClients() {
        return clientRepository.findAll();
    }

    // ✅ 2. ADD CLIENT
    @PostMapping
    public Client addClient(@RequestBody Client client) {

        long count = clientRepository.count() + 1;
        String generatedClientId = "CLD-" + String.format("%03d", count);

        client.setClientId(generatedClientId);
        client.setJoinDate(LocalDate.now().toString());

        return clientRepository.save(client);
    }


    // ✅ 3. UPDATE CLIENT STATUS
    @PutMapping("/{id}")
    public Client updateClient(
            @PathVariable String id,
            @RequestBody Client updatedClient) {

        Client client = clientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Client not found"));

        client.setStatus(updatedClient.getStatus());
        return clientRepository.save(client);
    }

    // ✅ 4. DELETE CLIENT
    @DeleteMapping("/{id}")
    public void deleteClient(@PathVariable String id) {
        clientRepository.deleteById(id);
    }
}

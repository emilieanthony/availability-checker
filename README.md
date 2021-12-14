# Availability Checker

# Description 

This component is part of the the distributed system DENTISTIMO, a web application that offers a geolocalisation based dental care booking system.
The avaliability checker provides the booking handler with valid booking request. More details can be found in the component diagram below as well as further in this README.md file.

## System Architecture - Component Diagram 

> ![System_Component_Diagram_v2.0](/uploads/c8d9a347486a4a79fa3f055f6ea35d3f/System_Component_Diagram_v2.0.png)

## Data Input 

## Component Responsibilities 

- Check if chosen time slot has available appointments 
- Forward this to frontend
- Validate booking request
- Trigger the booking handler


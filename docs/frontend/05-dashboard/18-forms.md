# Forms Specification

All configuration input actions (e.g., simulation naming, topology creations, worker adjustments) must enforce strict validations.

## 1. Validation Stack
* **Zod Schemas**: Every form inputs map directly to a corresponding Zod schema for client and server type alignment.
* **Form Engine**: Forms utilize **React Hook Form** for state management, tracking touched states, dirty fields, and inputs errors.

## 2. Dynamic Input UX States
* **Submitting State**: Action buttons show loading indicators (e.g., small spinning circle) and disable form actions during active API calls.
* **Validation Feedback**: Invalid input fields render a solid warning border (`border-rose-500`) and display helper text (`text-xs text-rose-500`) directly beneath the element, shifting focus back to the first validation error.

// Central registry of AppCreator element IDs used across the client area.
// `null` means the AppCreator element does not yet exist in the backend; the
// related UI (modals, action buttons) renders disabled until the value is set.
export const ELEMENTS = {
    // Views
    VW_CLIENTS: 1,
    VW_POINTS: 2,
    VW_DEVICES: 3,
    VW_SEMESTER_DEV: 4,
    VW_YEAR_DEV: 5,
    VW_HOUR_DEV: 6,
    VW_DAY_DEV: 7,

    // Forms — already wired
    FORM_ADD_CLIENT: 8,
    FORM_EDIT_CLIENT: 9,

    // Forms — pending backend element IDs
    FORM_ADD_POS: null,
    FORM_EDIT_POS: null,
    FORM_ADD_DEVICE: null,
    FORM_EDIT_DEVICE: null,
    FORM_ADD_CONTACT: null,
    FORM_EDIT_CONTACT: null,
    FORM_ADD_SCHEDULE: null,
}

export const PENDING_ELEMENT_HINT = "Pendiente de configuración en AppCreator"

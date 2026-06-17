## ADDED Requirements

### Requirement: EditWaveModal component SHALL replace inline edit/create wave modals

The system SHALL provide an `<EditWaveModal>` component in `src/components/EditWaveModal/index.js` that replaces the inline Modal JSX blocks in WaveDetail, WavesHub (edit), and WavesHub (create). The component SHALL accept props for title, initial data, save handler, and loading state.

#### Scenario: Edit existing wave
- **WHEN** `<EditWaveModal visible={true} title="Edit Wave" initialData={{ name: "Beach", description: "Summer 2024" }} onSave={(data) => updateWave(data)} onClose={() => setVisible(false)} saving={false} />` is rendered
- **THEN** the modal displays with pre-populated fields and a "Save" button

#### Scenario: Create new wave
- **WHEN** `<EditWaveModal visible={true} title="Create Wave" initialData={{ name: "", description: "" }} onSave={(data) => createWave(data)} onClose={() => setVisible(false)} saving={false} />` is rendered
- **THEN** the modal displays with empty name field and a "Create" button

#### Scenario: Saving state shows activity indicator
- **WHEN** `saving={true}` and the user taps "Save"
- **THEN** the button displays an `ActivityIndicator` instead of text and is disabled

#### Scenario: Cancel closes modal
- **WHEN** the user taps "Cancel"
- **THEN** the modal closes and `onSave` is not invoked

#### Scenario: Validation rejects empty name
- **WHEN** the user taps "Save" with an empty name field
- **THEN** the `onSave` callback is not invoked and the name input shows a validation error

### Requirement: WaveDetail SHALL use EditWaveModal

The system SHALL replace WaveDetail's inline Modal JSX for editing waves with `<EditWaveModal>`.

#### Scenario: WaveDetail renders EditWaveModal
- **WHEN** WaveDetail's edit modal state changes
- **THEN** `<EditWaveModal>` is rendered with the correct `editingWave` data

### Requirement: WavesHub SHALL use EditWaveModal

The system SHALL replace WavesHub's inline Modal JSX for both editing and creating waves with `<EditWaveModal>`.

#### Scenario: WavesHub edit uses EditWaveModal
- **WHEN** WavesHub's edit modal state changes
- **THEN** `<EditWaveModal>` is rendered with `editingWave` data

#### Scenario: WavesHub create uses EditWaveModal
- **WHEN** WavesHub's create modal opens
- **THEN** `<EditWaveModal>` is rendered with empty initial data and title "Create Wave"

import { ModalProps } from "react-native";

// NB: We need to mock the modal because it otherwise renders all of its contents, even when not
// displayed in tests.
// https://github.com/vanGalilea/react-native-testing/blob/master/__tests__/Modal.test.tsx
export const mockModal = () => {
  jest.mock("react-native/Libraries/Modal/Modal", () => {
    const Modal = jest.requireActual("react-native/Libraries/Modal/Modal");
    return (props: ModalProps) => <Modal {...props} />;
  });
};

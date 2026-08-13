export type ModalProps<Input extends object, Output> = Input & {
  resolve(value: Output): void;
  reject(reason?: unknown): void;
  dismiss(): void;
};

export class ModalDismissedError extends Error {
  constructor(message = "The modal was dismissed") {
    super(message);
    this.name = "ModalDismissedError";
  }
}

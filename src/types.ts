import type { ComponentProps, ComponentType, PropsWithChildren } from "react";

type ModalControlProps<Output> = {
  resolve(value: Output): void;
  reject(reason?: unknown): void;
  dismiss(): void;
};

export type ModalProps<Input extends object, Output> = Input &
  ModalControlProps<Output>;

export type AsyncModalComponent<Input extends object, Output> = ComponentType<
  ModalProps<Input, Output>
>;

export type AsyncModalBackdropProps = PropsWithChildren<{
  dismiss(): void;
}>;

export type AsyncModalHostProps = {
  backdrop?: ComponentType<AsyncModalBackdropProps>;
  dismissOnEscape?: boolean;
};

export type CallerModalProps<Input extends object> = Input & {
  resolve?: never;
  reject?: never;
  dismiss?: never;
};

export type ModalInput<Component extends ComponentType<any>> = Omit<
  ComponentProps<Component>,
  keyof ModalControlProps<unknown>
>;

export type ModalOutput<Component extends ComponentType<any>> =
  ComponentProps<Component> extends ModalControlProps<infer Output>
    ? Output
    : never;

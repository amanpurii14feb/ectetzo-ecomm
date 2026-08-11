"use client";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import * as SelectPrimitive from "@radix-ui/react-select";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
export function Checkbox({
  checked,
  defaultChecked,
  onCheckedChange,
  disabled,
  className = "",
}: {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <CheckboxPrimitive.Root
      className={`rx-checkbox ${className}`}
      checked={checked}
      defaultChecked={defaultChecked}
      disabled={disabled}
      onCheckedChange={(value) => onCheckedChange?.(value === true)}
    >
      <CheckboxPrimitive.Indicator>
        <Check />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}
export type SelectOption = { value: string; label: string; disabled?: boolean };
export function Select({
  value,
  onValueChange,
  options,
  placeholder = "Select",
  disabled,
  className = "",
}: {
  value?: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <SelectPrimitive.Root
      value={value || undefined}
      onValueChange={onValueChange}
      disabled={disabled}
    >
      <SelectPrimitive.Trigger className={`rx-select ${className}`}>
        <SelectPrimitive.Value placeholder={placeholder} />
        <SelectPrimitive.Icon>
          <ChevronDown />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          className="rx-select-content"
          position="popper"
          sideOffset={5}
        >
          <SelectPrimitive.ScrollUpButton className="rx-select-scroll">
            <ChevronUp />
          </SelectPrimitive.ScrollUpButton>
          <SelectPrimitive.Viewport>
            {options.map((option) => (
              <SelectPrimitive.Item
                className="rx-select-item"
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                <SelectPrimitive.ItemText>
                  {option.label}
                </SelectPrimitive.ItemText>
                <SelectPrimitive.ItemIndicator>
                  <Check />
                </SelectPrimitive.ItemIndicator>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
          <SelectPrimitive.ScrollDownButton className="rx-select-scroll">
            <ChevronDown />
          </SelectPrimitive.ScrollDownButton>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}
export function Switch({
  checked,
  onCheckedChange,
  disabled,
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <SwitchPrimitive.Root
      className="rx-switch"
      checked={checked}
      onCheckedChange={onCheckedChange}
      disabled={disabled}
    >
      <SwitchPrimitive.Thumb className="rx-switch-thumb" />
    </SwitchPrimitive.Root>
  );
}

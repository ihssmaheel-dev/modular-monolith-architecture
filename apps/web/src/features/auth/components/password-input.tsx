import { useState } from "react";
import type { UseFormRegister, FieldValues, Path } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";

export function PasswordInput<T extends FieldValues>({
  id,
  register,
  placeholder,
  invalid,
  showLabel,
  hideLabel,
}: {
  id: string;
  register: UseFormRegister<T>;
  placeholder: string;
  invalid?: boolean;
  showLabel: string;
  hideLabel: string;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <Input
        id={id}
        type={visible ? "text" : "password"}
        placeholder={placeholder}
        aria-invalid={invalid}
        className="pe-10"
        {...register("password" as Path<T>)}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="absolute end-1 top-1/2 size-7 -translate-y-1/2"
        onClick={() => setVisible((value) => !value)}
        aria-label={visible ? hideLabel : showLabel}
      >
        {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </Button>
    </div>
  );
}

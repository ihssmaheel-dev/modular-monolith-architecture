import { Alert } from "react-native";
import i18n from "@/lib/i18n";

interface ConfirmDialogOptions {
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
  onConfirm: () => void;
}

export function confirmDialog({
  title,
  description,
  confirmText = i18n.t("common.confirm"),
  cancelText = i18n.t("common.cancel"),
  destructive,
  onConfirm,
}: ConfirmDialogOptions) {
  Alert.alert(title, description, [
    { text: cancelText, style: "cancel" },
    { text: confirmText, style: destructive ? "destructive" : "default", onPress: onConfirm },
  ]);
}

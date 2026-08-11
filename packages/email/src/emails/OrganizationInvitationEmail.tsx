import {
  Body,
  Button,
  Container,
  Head,
  Html,
  Preview,
  Tailwind,
  Text,
} from "@react-email/components";

interface OrganizationInvitationEmailProps {
  acceptUrl: string;
  preview: string;
  heading: string;
  body: string;
  buttonText: string;
}

export function OrganizationInvitationEmail({
  acceptUrl,
  preview,
  heading,
  body,
  buttonText,
}: OrganizationInvitationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] w-[465px]">
            <Text className="text-black text-[18px] leading-[28px] font-semibold">{heading}</Text>
            <Text className="text-black text-[14px] leading-[24px]">{body}</Text>
            <Button
              className="bg-[#000000] rounded text-white text-[12px] font-semibold no-underline text-center px-4 py-3"
              href={acceptUrl}
            >
              {buttonText}
            </Button>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

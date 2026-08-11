import { ContentPage } from "@/components/content-page";
import { ContactForm } from "@/components/contact-form";
export default function Page() {
  return (
    <ContentPage title="How can we help?">
      <p>
        Call us at <b>1800 202 8658</b> Monday–Saturday, 9am–7pm, or email{" "}
        <b>care@electzo.in</b>.
      </p>
      <ContactForm />
    </ContentPage>
  );
}

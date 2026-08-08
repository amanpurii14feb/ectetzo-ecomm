import { ContentPage } from "@/components/content-page";
export default function Page() {
  return (
    <ContentPage title="Privacy policy">
      <p>
        We collect only the information needed to provide orders, account
        services and support. We do not sell personal information.
      </p>
      <p>
        Payment credentials will be handled securely by the selected payment
        provider when payments are integrated.
      </p>
    </ContentPage>
  );
}

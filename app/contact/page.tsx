import { ContentPage } from "@/components/content-page";
export default function Page() {
  return (
    <ContentPage title="How can we help?">
      <p>
        Call us at <b>1800 202 8658</b> Monday–Saturday, 9am–7pm, or email{" "}
        <b>care@electzo.in</b>.
      </p>
      <form className="card grid gap-4 p-6">
        <input className="field" placeholder="Your name" />
        <input className="field" placeholder="Email or mobile" />
        <textarea
          className="field min-h-28"
          placeholder="Tell us how we can help"
        />
        <button className="btn btn-dark w-fit">Send message</button>
      </form>
    </ContentPage>
  );
}

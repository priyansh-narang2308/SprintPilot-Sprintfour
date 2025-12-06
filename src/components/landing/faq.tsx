import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../components/ui/accordion";

const faqs = [
  {
    question: "What is SprintPilot?",
    answer:
      "SprintPilot is an AI-powered platform that helps founders and product teams generate complete startup blueprints including PRDs, user personas, journey maps, wireframes, roadmaps, and competitive analysis. It transforms your startup idea into actionable documentation in minutes.",
  },
  {
    question: "How accurate is the AI-generated content?",
    answer:
      "Our AI is trained on thousands of successful product documents and startup frameworks. While the generated content provides an excellent starting point (typically 80-90% ready), we recommend reviewing and customizing it for your specific needs. The AI continuously learns from user feedback to improve accuracy.",
  },
  {
    question: "Can I export my documents?",
    answer:
      "Yes! You can export all your documents in multiple formats including PDF, Markdown, and DOCX. We also support direct integration with tools like Jira, Notion, and Linear for seamless workflow integration.",
  },
  {
    question: "Is my data secure?",
    answer:
      "Absolutely. We take security seriously. All data is encrypted at rest and in transit. We're SOC 2 Type II compliant and never use your data to train our AI models. Your startup ideas remain completely confidential.",
  },
];

const FAQ = () => {
  return (
    <section id="faq" className="py-24">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mt-4 mb-6">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-muted-foreground">
            Have questions? We've got answers.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-card rounded-xl border border-border/50 px-6 overflow-hidden"
              >
                <AccordionTrigger className="text-left hover:no-underline py-5">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQ;

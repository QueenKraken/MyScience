import ArticleCard from "../ArticleCard";

export default function ArticleCardExample() {
  return (
    <div className="max-w-3xl">
      <ArticleCard
        title="CRISPR-Cas9 gene editing in human embryos: Ethical considerations and future directions"
        authors={["Zhang, Y.", "Liu, H.", "Chen, M."]}
        journal="Nature Biotechnology"
        date="Nov 2025"
        abstract="Recent advances in CRISPR-Cas9 technology have opened new possibilities for treating genetic diseases. This study examines the ethical implications and regulatory frameworks necessary for responsible application of gene editing in human embryos, with particular attention to germline modifications and their long-term consequences."
        tags={["Gene Editing", "Ethics", "CRISPR"]}
        onSave={() => console.log("Article saved")}
        onView={() => console.log("View article clicked")}
      />
    </div>
  );
}

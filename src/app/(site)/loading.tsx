import { T } from "@/components/site/T";

export default function Loading() {
  return (
    <div className="pageload" role="status">
      <div className="grains" aria-hidden="true"><i /><i /><i /></div>
      <span className="sr"><T k="loading" /></span>
    </div>
  );
}

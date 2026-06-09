import { getAnalytics } from "@/actions/analytics"
import { AnalyticsClient } from "@/features/analytics/analytics-client"

export default async function AnalyticsPage() {
  const data = await getAnalytics()

  return <AnalyticsClient data={data} />
}

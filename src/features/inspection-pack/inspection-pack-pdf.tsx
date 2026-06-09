import React from "react"
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer"
import type { InspectionPackData } from "@/actions/inspection-pack"

// react-pdf ships with built-in fonts (Helvetica, Courier, Times-Roman).
// We use the built-in Helvetica family which maps to these weights.
// (No Font.register() needed.)

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    lineHeight: 1.5,
    color: "#334155",
  },
  header: {
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    paddingBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 700,
    color: "#1E293B",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 11,
    color: "#64748B",
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 700,
    color: "#475569",
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  businessGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  businessField: {
    width: "48%",
    marginBottom: 4,
    fontSize: 10,
  },
  label: {
    fontWeight: 700,
    color: "#475569",
  },
  value: {
    color: "#334155",
  },
  summaryRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
  },
  summaryCard: {
    flex: 1,
    padding: 10,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  summaryNumber: {
    fontSize: 16,
    fontWeight: 700,
    color: "#1E293B",
  },
  summaryLabel: {
    fontSize: 8,
    color: "#64748B",
    marginTop: 2,
  },
  itemRow: {
    flexDirection: "row",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    fontSize: 9,
  },
  itemTitle: {
    flex: 1,
  },
  badge: {
    fontSize: 8,
    color: "#64748B",
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  badgeCategory: {
    fontSize: 8,
    color: "#475569",
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  disclaimer: {
    marginTop: 32,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    fontSize: 7,
    color: "#94A3B8",
    textAlign: "center",
    lineHeight: 1.6,
  },
  emptyState: {
    fontSize: 10,
    color: "#94A3B8",
    textAlign: "center",
    marginTop: 20,
  },
  notes: {
    fontSize: 8,
    color: "#64748B",
    marginTop: 2,
  },
  metaContainer: {
    flexDirection: "row",
    gap: 4,
    alignItems: "center",
  },
})

interface InspectionPackPDFProps {
  data: InspectionPackData
}

function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date))
}

export function InspectionPackPDF({ data }: InspectionPackPDFProps) {
  const { workspaceName, sector, address, contactName, contactEmail, phone, summary, completedItems } = data

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{workspaceName}</Text>
          <Text style={styles.subtitle}>
            Inspection Pack — Generated {formatDate(data.generatedAt)}
          </Text>
        </View>

        {/* Business Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Business Details</Text>
          <View style={styles.businessGrid}>
            {contactName && (
              <View style={styles.businessField}>
                <Text style={styles.label}>Contact: </Text>
                <Text style={styles.value}>{contactName}</Text>
              </View>
            )}
            {contactEmail && (
              <View style={styles.businessField}>
                <Text style={styles.label}>Email: </Text>
                <Text style={styles.value}>{contactEmail}</Text>
              </View>
            )}
            {phone && (
              <View style={styles.businessField}>
                <Text style={styles.label}>Phone: </Text>
                <Text style={styles.value}>{phone}</Text>
              </View>
            )}
            {sector && (
              <View style={styles.businessField}>
                <Text style={styles.label}>Sector: </Text>
                <Text style={styles.value}>{sector}</Text>
              </View>
            )}
            {address && (
              <View style={styles.businessField}>
                <Text style={styles.label}>Address: </Text>
                <Text style={styles.value}>{address}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Compliance Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Compliance Summary</Text>
          <View style={styles.summaryRow}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryNumber}>{summary.totalTasks}</Text>
              <Text style={styles.summaryLabel}>Total checks</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryNumber}>{summary.completedOnTime}</Text>
              <Text style={styles.summaryLabel}>Completed on time</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryNumber}>{summary.overdueCount}</Text>
              <Text style={styles.summaryLabel}>Currently overdue</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryNumber}>{summary.complianceScore}%</Text>
              <Text style={styles.summaryLabel}>Compliance score</Text>
            </View>
          </View>
        </View>

        {/* Completed Checklist Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Completed Checklist Items ({completedItems.length})
          </Text>
          {completedItems.length === 0 ? (
            <Text style={styles.emptyState}>No items have been completed yet.</Text>
          ) : (
            completedItems.map((item) => (
              <View key={item.id} style={styles.itemRow}>
                <View style={styles.itemTitle}>
                  <Text>{item.taskTitle}</Text>
                  <Text style={styles.notes}>
                    Completed {formatDate(item.completedAt)}
                    {item.completedByName ? ` by ${item.completedByName}` : ""}
                  </Text>
                  {item.notes && (
                    <Text style={styles.notes}>Note: {item.notes}</Text>
                  )}
                </View>
                <View style={styles.metaContainer}>
                  {item.category && (
                    <Text style={styles.badgeCategory}>{item.category.replace(/-/g, " ")}</Text>
                  )}
                  <Text style={styles.badge}>{item.frequency}</Text>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Disclaimer */}
        <View style={styles.disclaimer}>
          <Text>
            SafeReady — Safety compliance for UK small businesses
            {"\n"}
            This document is a summary of compliance activities and does not constitute legal advice. Businesses should seek professional guidance on their specific legal obligations.
          </Text>
        </View>
      </Page>
    </Document>
  )
}

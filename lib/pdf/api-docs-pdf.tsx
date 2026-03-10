import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import type { SavedRequest, KeyValuePair } from "@/types/request";
import type { DocsGroup } from "@/lib/docs-builder";
import { sanitizePdfText } from "./sanitize-text";
import { generateCode, type CodeLanguage } from "@/lib/codegen/generate-code";

/* ------------------------------------------------------------------ */
/*  Colors                                                             */
/* ------------------------------------------------------------------ */
const makePdfColors = (accent: string) => ({
  accent,
  black: "#111111",
  gray: "#4B5563",
  muted: "#9CA3AF",
  border: "#E5E7EB",
  codeBg: "#F3F4F6",
  white: "#FFFFFF",
  amber: "#D97706",
});

const METHOD_COLORS: Record<string, { bg: string; text: string }> = {
  GET: { bg: "#DCFCE7", text: "#15803D" },
  POST: { bg: "#DBEAFE", text: "#1D4ED8" },
  PUT: { bg: "#FEF9C3", text: "#A16207" },
  PATCH: { bg: "#F3E8FF", text: "#7E22CE" },
  DELETE: { bg: "#FEE2E2", text: "#B91C1C" },
};

type PdfColors = ReturnType<typeof makePdfColors>;

/* ------------------------------------------------------------------ */
/*  Styles                                                             */
/* ------------------------------------------------------------------ */
const makeStyles = (colors: PdfColors) =>
  StyleSheet.create({
    page: {
      backgroundColor: colors.white,
      padding: 40,
      paddingBottom: 60,
      fontFamily: "Helvetica",
    },

    /* Cover */
    coverTitle: {
      fontSize: 28,
      fontWeight: "bold",
      color: colors.black,
      marginBottom: 8,
    },
    coverSubtitle: { fontSize: 12, color: colors.gray },

    /* TOC */
    tocTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: colors.black,
      marginBottom: 16,
    },
    tocFolderRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 6,
      marginTop: 12,
    },
    tocRequestRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 4,
      paddingLeft: 12,
    },
    tocRequestName: { fontSize: 9, color: colors.black, flex: 1 },
    tocUrl: { fontSize: 8, color: colors.muted, flex: 2 },

    /* Folder */
    folderHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 20,
      paddingBottom: 8,
      borderBottomWidth: 2,
      borderBottomColor: colors.border,
    },
    folderTitle: { fontSize: 16, fontWeight: "bold" },

    /* Endpoint */
    endpointName: { fontSize: 12, fontWeight: "bold", color: colors.black },
    endpointUrl: {
      fontFamily: "Courier",
      fontSize: 9,
      color: colors.gray,
      marginBottom: 2,
    },

    /* Param section */
    sectionLabel: { fontSize: 8, fontWeight: "bold", letterSpacing: 0.8 },
    paramRow: { paddingVertical: 8, paddingHorizontal: 4 },
    paramKey: { fontSize: 10, fontWeight: "bold", fontFamily: "Courier" },
    paramType: { fontSize: 9, color: colors.muted },
    paramExample: { fontSize: 9, color: colors.muted, fontFamily: "Courier" },

    /* Text */
    body: { fontSize: 9, lineHeight: 1.5, color: colors.gray },
    muted: { fontSize: 8, color: colors.muted },
  });

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function MethodBadge({ method }: { method: string }) {
  const c = METHOD_COLORS[method] ?? METHOD_COLORS.GET;
  return (
    <View
      style={{
        backgroundColor: c.bg,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
      }}
    >
      <Text style={{ fontSize: 8, fontWeight: "bold", color: c.text }}>
        {method}
      </Text>
    </View>
  );
}

function PageNumber({ colors }: { colors: PdfColors }) {
  return (
    <Text
      style={{
        position: "absolute",
        bottom: 24,
        right: 40,
        fontSize: 8,
        color: colors.muted,
      }}
      render={({ pageNumber, totalPages }) =>
        `${pageNumber} / ${totalPages}`
      }
      fixed
    />
  );
}

function ParamSection({
  title,
  rows,
  colors,
  styles,
}: {
  title: string;
  rows: KeyValuePair[];
  colors: PdfColors;
  styles: ReturnType<typeof makeStyles>;
}) {
  return (
    <View style={{ marginTop: 12 }}>
      <Text style={{ ...styles.sectionLabel, color: colors.muted }}>
        {title.toUpperCase()}
      </Text>
      <View
        style={{
          borderTopWidth: 1,
          borderTopColor: colors.border,
          marginTop: 4,
        }}
      >
        {rows.map((row, i) => (
          <View
            key={`${row.key}-${i}`}
            style={{
              ...styles.paramRow,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
            }}
          >
            {/* Line 1: key · type · Required/Optional */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
              >
                <Text style={{ ...styles.paramKey, color: colors.accent }}>
                  {sanitizePdfText(row.key)}
                </Text>
                <Text style={styles.paramType}>{sanitizePdfText(row.type) || "string"}</Text>
                {row.value && !row.sensitive && (
                  <Text style={styles.paramExample}>{sanitizePdfText(row.value)}</Text>
                )}
              </View>
              <Text
                style={{
                  fontSize: 8,
                  fontWeight: "bold",
                  color: row.deprecated
                    ? colors.amber
                    : row.required
                      ? colors.accent
                      : colors.muted,
                }}
              >
                {row.deprecated
                  ? "Deprecated"
                  : row.required
                    ? "Required"
                    : "Optional"}
              </Text>
            </View>
            {/* Line 2: description */}
            {row.description && (
              <Text
                style={{ ...styles.body, color: colors.gray, marginTop: 2 }}
              >
                {sanitizePdfText(row.description)}
              </Text>
            )}
            {/* Sensitive indicator */}
            {row.sensitive && (
              <Text
                style={{
                  ...styles.body,
                  color: colors.muted,
                  fontStyle: "italic",
                  marginTop: 2,
                }}
              >
{"***** (sensitive -- value hidden)"}
              </Text>
            )}
          </View>
        ))}
      </View>
    </View>
  );
}

function BodySection({
  request,
  colors,
  styles,
}: {
  request: SavedRequest;
  colors: PdfColors;
  styles: ReturnType<typeof makeStyles>;
}) {
  const bodyType = request.body.type;

  if (bodyType === "form") {
    const rows = request.body.formData?.filter((f) => f.key.trim()) ?? [];
    if (rows.length === 0) return null;
    return (
      <ParamSection
        title="Request Body (Form Data)"
        rows={rows}
        colors={colors}
        styles={styles}
      />
    );
  }

  if ((bodyType === "json" || bodyType === "raw") && request.body.content) {
    return (
      <View style={{ marginTop: 12 }}>
        <Text style={{ ...styles.sectionLabel, color: colors.muted }}>
          {`REQUEST BODY (${bodyType.toUpperCase()})`}
        </Text>
        <View
          style={{
            backgroundColor: colors.codeBg,
            borderRadius: 4,
            padding: 10,
            marginTop: 4,
          }}
        >
          <Text
            style={{
              fontFamily: "Courier",
              fontSize: 8,
              color: colors.black,
              lineHeight: 1.6,
            }}
          >
            {sanitizePdfText(request.body.content)}
          </Text>
        </View>
      </View>
    );
  }

  return null;
}

function EndpointBlock({
  request,
  colors,
  styles,
  isLast,
  includedLanguages,
}: {
  request: SavedRequest;
  colors: PdfColors;
  styles: ReturnType<typeof makeStyles>;
  isLast: boolean;
  includedLanguages: CodeLanguage[];
}) {
  const visibleParams = request.params.filter((p) => p.key.trim());
  const visibleHeaders = request.headers.filter((h) => h.key.trim());
  const hasBody = request.method !== "GET";
  const bodyType = request.body.type;
  const visibleFormData =
    request.body.formData?.filter((f) => f.key.trim()) ?? [];
  const hasBodyContent =
    hasBody &&
    ((bodyType === "form" && visibleFormData.length > 0) ||
      ((bodyType === "json" || bodyType === "raw") && request.body.content));

  return (
    <View
      style={{
        marginBottom: isLast ? 0 : 24,
        paddingBottom: isLast ? 0 : 24,
        borderBottomWidth: isLast ? 0 : 1,
        borderBottomColor: colors.border,
      }}
      wrap={false}
    >
      {/* Method + Name */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          marginBottom: 4,
        }}
      >
        <MethodBadge method={request.method} />
        <Text style={styles.endpointName}>
          {sanitizePdfText(request.name) || "Untitled"}
        </Text>
      </View>

      {/* URL */}
      <Text style={styles.endpointUrl}>{sanitizePdfText(request.url) || "No URL set"}</Text>

      {/* Description */}
      {request.description && (
        <Text style={{ ...styles.body, marginTop: 6 }}>
          {sanitizePdfText(request.description)}
        </Text>
      )}

      {/* Params */}
      {visibleParams.length > 0 && (
        <ParamSection
          title="Query Parameters"
          rows={visibleParams}
          colors={colors}
          styles={styles}
        />
      )}

      {/* Headers */}
      {visibleHeaders.length > 0 && (
        <ParamSection
          title="Header Parameters"
          rows={visibleHeaders}
          colors={colors}
          styles={styles}
        />
      )}

      {/* Body */}
      {hasBodyContent && (
        <BodySection request={request} colors={colors} styles={styles} />
      )}

      {/* Code snippets */}
      {includedLanguages.length > 0 && (
        <View style={{ marginTop: 14 }}>
          <Text style={{ ...styles.sectionLabel, color: colors.muted }}>CODE SNIPPETS</Text>
          {includedLanguages.map((lang, i) => {
            const code = generateCode(request, lang);
            return (
              <View key={lang} style={{ marginTop: i === 0 ? 6 : 10 }}>
                {/* Language label */}
                <View style={{ backgroundColor: colors.border, paddingHorizontal: 8,
                               paddingVertical: 3, borderTopLeftRadius: 4, borderTopRightRadius: 4 }}>
                  <Text style={{ fontSize: 8, fontWeight: "bold", color: colors.gray }}>
                    {lang.toUpperCase()}
                  </Text>
                </View>
                {/* Code block */}
                <View style={{ backgroundColor: colors.codeBg, padding: 10,
                               borderBottomLeftRadius: 4, borderBottomRightRadius: 4 }}>
                  <Text style={{ fontFamily: "Courier", fontSize: 7.5,
                                 color: colors.black, lineHeight: 1.7 }}>
                    {sanitizePdfText(code)}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

/* ------------------------------------------------------------------ */
/*  Main document                                                      */
/* ------------------------------------------------------------------ */

interface ApiDocsPdfProps {
  groups: DocsGroup[];
  accent: string;
  title: string;
  summary: string | null;
  includedLanguages: CodeLanguage[];
}

export function ApiDocsPdf({ groups, accent, title, summary, includedLanguages }: ApiDocsPdfProps) {
  const colors = makePdfColors(accent);
  const styles = makeStyles(colors);

  const totalEndpoints = groups.reduce(
    (sum, g) => sum + g.requests.length,
    0
  );

  return (
    <Document>
      {/* ---- Cover page ---- */}
      <Page size="A4" style={styles.page}>
        {/* Accent bar */}
        <View
          style={{ height: 6, backgroundColor: accent, marginBottom: 48 }}
        />

        <View
          style={{
            flex: 1,
            justifyContent: "center",
            paddingHorizontal: 48,
          }}
        >
          <Text style={styles.coverTitle}>{sanitizePdfText(title)}</Text>

          {summary && (
            <Text style={{ ...styles.body, marginTop: 10, fontSize: 11, lineHeight: 1.6 }}>
              {sanitizePdfText(summary)}
            </Text>
          )}

          <Text style={{ ...styles.coverSubtitle, marginTop: summary ? 16 : 8 }}>
            {`Generated with PostPurush · ${new Date().toLocaleDateString(
              "en-US",
              { year: "numeric", month: "long", day: "numeric" }
            )}`}
          </Text>
          <Text style={{ ...styles.muted, marginTop: 4 }}>
             {`${totalEndpoints} endpoint${totalEndpoints !== 1 ? "s" : ""} across ${groups.length} section${groups.length !== 1 ? "s" : ""}`}
             {includedLanguages.length > 0 && ` · Code: ${includedLanguages.map(l => l.toUpperCase()).join(", ")}`}
          </Text>
        </View>

        <View
          style={{
            position: "absolute",
            bottom: 24,
            left: 40,
            right: 40,
          }}
        >
          <Text style={styles.muted}>PostPurush</Text>
        </View>
      </Page>

      {/* ---- Table of Contents ---- */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.tocTitle}>Contents</Text>

        {groups.map((group, gi) => (
          <View key={gi} style={{ marginBottom: 4 }}>
            <View style={styles.tocFolderRow}>
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: "bold",
                  color: accent,
                }}
              >
                {sanitizePdfText(group.folderName)}
              </Text>
            </View>
            {group.requests.map((req, ri) => (
              <View key={ri} style={styles.tocRequestRow}>
                <MethodBadge method={req.method} />
                <Text style={styles.tocRequestName}>
                  {sanitizePdfText(req.name) || "Untitled"}
                </Text>
                <Text style={styles.tocUrl}>
                  {sanitizePdfText(req.url)}
                </Text>
              </View>
            ))}
          </View>
        ))}

        <PageNumber colors={colors} />
      </Page>

      {/* ---- Endpoint pages (one page per folder group) ---- */}
      {groups.map((group, gi) => (
        <Page key={gi} size="A4" style={styles.page}>
          {/* Folder header */}
          <View style={styles.folderHeader}>
            <View
              style={{
                width: 3,
                backgroundColor: accent,
                marginRight: 10,
                borderRadius: 2,
                alignSelf: "stretch",
              }}
            />
            <Text style={{ ...styles.folderTitle, color: accent }}>
              {sanitizePdfText(group.folderName)}
            </Text>
          </View>

          {group.requests.map((req, ri) => (
            <EndpointBlock
              key={req.id}
              request={req}
              colors={colors}
              styles={styles}
              isLast={ri === group.requests.length - 1}
              includedLanguages={includedLanguages}
            />
          ))}

          <PageNumber colors={colors} />
        </Page>
      ))}
    </Document>
  );
}

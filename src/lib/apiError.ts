export function getApiErrorMessage(err: any): string {
  try {
    if (!err) return "Unknown error";
    const resp = err.response || err;
    if (resp && resp.data) {
      const d = resp.data;
      if (typeof d === "string") return d;
      // prefer display_messages if available
      if (d.display_messages && Array.isArray(d.display_messages)) return d.display_messages.join("; ");
      if (d.message && typeof d.message === "string") return d.message;
      // d.error can be a string or object
      if (d.error) {
        if (typeof d.error === "string") return d.error;
        if (d.error.message && typeof d.error.message === "string") return d.error.message;
        if (d.error.display_messages && Array.isArray(d.error.display_messages)) return d.error.display_messages.join("; ");
        return JSON.stringify(d.error);
      }
      if (d.errors) return typeof d.errors === "string" ? d.errors : JSON.stringify(d.errors);
      return JSON.stringify(d);
    }
    if (err.message) return String(err.message);
    return String(err);
  } catch (e) {
    return "Unknown error";
  }
}

/**
 * CRISISCOPE X — Data Explorer & File Validation Engine
 * Manages dataset registry, CSV/JSON/GeoJSON uploads, coordinate validation, and schema checks.
 */

const DataExplorer = {
  async init() {
    await this.loadDatasets();
    this.bindUploadForm();
  },

  async loadDatasets() {
    const tbody = document.getElementById("dataset-registry-tbody");
    if (!tbody) return;

    try {
      const data = await API.getDatasets();
      const datasets = data.datasets || [];

      tbody.innerHTML = datasets
        .map(
          (ds) => `
        <tr>
          <td>
            <div style="font-weight:700;">${ds.name}</div>
            <div class="font-mono text-muted" style="font-size:10px;">${ds.id}</div>
          </td>
          <td><span class="badge badge-cyan">${ds.fileType}</span></td>
          <td class="font-mono">${ds.recordCount}</td>
          <td>
            <span class="badge ${ds.classification === 'SYNTHETIC_FIXTURE' ? 'badge-blue' : 'badge-green'}">
              ${ds.classification}
            </span>
          </td>
          <td>
            <span class="badge ${ds.validationStatus === 'SYNTHETIC_VERIFIED' || ds.validationStatus === 'VERIFIED_IMPORTED' ? 'badge-green' : 'badge-amber'}">
              ✓ ${ds.validationStatus}
            </span>
          </td>
          <td style="font-size:11px; color:var(--text-muted);">${new Date(ds.createdAt).toLocaleDateString()}</td>
        </tr>
      `
        )
        .join("");
    } catch (err) {
      console.error("Failed to load dataset registry:", err);
    }
  },

  bindUploadForm() {
    const fileInput = document.getElementById("file-upload-input");
    const dropzone = document.getElementById("file-upload-dropzone");
    const uploadBtn = document.getElementById("btn-submit-upload");

    if (dropzone && fileInput) {
      dropzone.addEventListener("click", () => fileInput.click());

      dropzone.addEventListener("dragover", (e) => {
        e.preventDefault();
        dropzone.style.borderColor = "var(--accent-cyan)";
      });

      dropzone.addEventListener("dragleave", () => {
        dropzone.style.borderColor = "var(--border-color)";
      });

      dropzone.addEventListener("drop", (e) => {
        e.preventDefault();
        dropzone.style.borderColor = "var(--border-color)";
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          fileInput.files = e.dataTransfer.files;
          this.handleFileSelected(fileInput.files[0]);
        }
      });

      fileInput.addEventListener("change", () => {
        if (fileInput.files && fileInput.files.length > 0) {
          this.handleFileSelected(fileInput.files[0]);
        }
      });
    }

    if (uploadBtn && fileInput) {
      uploadBtn.addEventListener("click", async () => {
        if (!fileInput.files || fileInput.files.length === 0) {
          alert("Please select a file to upload first.");
          return;
        }

        const formData = new FormData();
        formData.append("file", fileInput.files[0]);

        uploadBtn.disabled = true;
        uploadBtn.textContent = "Validating...";

        try {
          const res = await API.uploadDataset(formData);
          this.showValidationResult(res.data);
          await this.loadDatasets();
        } catch (err) {
          alert("Upload failed: " + err.message);
        } finally {
          uploadBtn.disabled = false;
          uploadBtn.textContent = "Upload & Validate Dataset";
        }
      });
    }
  },

  handleFileSelected(file) {
    const display = document.getElementById("selected-filename-display");
    if (display) {
      display.textContent = `Selected: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
      display.style.display = "block";
    }
  },

  showValidationResult(result) {
    const modal = document.getElementById("upload-result-modal");
    const body = document.getElementById("upload-result-body");
    if (!modal || !body) return;

    const isValid = result.valid;
    const badgeColor = isValid ? "green" : "red";

    body.innerHTML = `
      <div style="margin-bottom:14px; text-align:center;">
        <span class="badge badge-${badgeColor}" style="font-size:13px; padding:6px 12px;">
          ${isValid ? "✓ VALIDATION PASSED — VERIFIED SCHEMA" : "⚠️ VALIDATION ISSUES DETECTED"}
        </span>
      </div>

      <div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:10px; background:var(--bg-secondary); padding:10px; border-radius:6px;">
        <span><strong>Records Parsed:</strong> ${result.record_count}</span>
        <span><strong>Dataset ID:</strong> <span class="font-mono text-muted">${result.dataset_id || "N/A"}</span></span>
      </div>

      ${result.errors && result.errors.length > 0
        ? `<div style="background:var(--accent-red-subtle); border:1px solid var(--accent-red); padding:10px; border-radius:6px; margin-bottom:12px; font-size:11px;">
            <strong>Validation Warnings:</strong>
            <ul style="padding-left:16px; margin-top:4px;">
              ${result.errors.map((e) => `<li>${e}</li>`).join("")}
            </ul>
          </div>`
        : ""
      }

      ${result.preview && result.preview.length > 0
        ? `<div style="margin-top:10px;">
            <div style="font-weight:700; font-size:12px; margin-bottom:6px;">Data Record Preview (First 5 Rows):</div>
            <pre style="background:var(--input-bg); border:1px solid var(--border-color); padding:10px; border-radius:6px; max-height:160px; overflow:auto; font-size:10px;">${JSON.stringify(result.preview, null, 2)}</pre>
          </div>`
        : ""
      }
    `;

    modal.classList.add("open");

    document.getElementById("btn-close-upload-modal")?.addEventListener("click", () => {
      modal.classList.remove("open");
    });
  }
};

window.DataExplorer = DataExplorer;

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("data-explorer-view")) {
    DataExplorer.init();
  }
});

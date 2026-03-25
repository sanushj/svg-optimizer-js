(function() {
    var dropZone = document.getElementById('svoDropZone');
    var selectBtn = document.getElementById('svoSelectBtn');
    var fileInput = document.getElementById('svoFileInput');
    var settingsEl = document.getElementById('svoSettings');
    var fileInfoEl = document.getElementById('svoFileInfo');
    var chkComments = document.getElementById('svoRemoveComments');
    var chkMetadata = document.getElementById('svoRemoveMetadata');
    var chkCleanIds = document.getElementById('svoCleanIds');
    var chkMergePaths = document.getElementById('svoMergePaths');
    var chkEmptyAttrs = document.getElementById('svoRemoveEmptyAttrs');
    var optimizeBtn = document.getElementById('svoOptimizeBtn');
    var resultEl = document.getElementById('svoResult');
    var origSizeEl = document.getElementById('svoOrigSize');
    var newSizeEl = document.getElementById('svoNewSize');
    var reductionEl = document.getElementById('svoReduction');
    var beforeEl = document.getElementById('svoBefore');
    var afterEl = document.getElementById('svoAfter');
    var downloadBtn = document.getElementById('svoDownloadBtn');
    var resetBtn = document.getElementById('svoResetBtn');

    var currentFile = null;
    var originalSvg = '';
    var optimizedSvg = '';

    function formatBytes(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / 1048576).toFixed(2) + ' MB';
    }

    function handleFile(file) {
        if (!file || (!file.type.includes('svg') && !file.name.toLowerCase().endsWith('.svg'))) {
            alert('Please select an SVG file.');
            return;
        }
        currentFile = file;
        var reader = new FileReader();
        reader.onload = function(e) {
            originalSvg = e.target.result;
            if (fileInfoEl) fileInfoEl.textContent = file.name + ' (' + formatBytes(file.size) + ')';
            if (dropZone) dropZone.style.display = 'none';
            if (settingsEl) settingsEl.style.display = 'flex';
            if (resultEl) resultEl.style.display = 'none';
        };
        reader.readAsText(file);
    }

    if (selectBtn) {
        selectBtn.addEventListener('click', function() {
            if (fileInput) fileInput.click();
        });
    }

    if (fileInput) {
        fileInput.addEventListener('change', function() {
            if (fileInput.files && fileInput.files[0]) handleFile(fileInput.files[0]);
        });
    }

    if (dropZone) {
        dropZone.addEventListener('dragover', function(e) {
            e.preventDefault();
            dropZone.classList.add('drag-over');
        });
        dropZone.addEventListener('dragleave', function() {
            dropZone.classList.remove('drag-over');
        });
        dropZone.addEventListener('drop', function(e) {
            e.preventDefault();
            dropZone.classList.remove('drag-over');
            var files = e.dataTransfer.files;
            if (files && files[0]) handleFile(files[0]);
        });
        dropZone.addEventListener('click', function(e) {
            if (e.target === selectBtn || (e.target.closest && e.target.closest('button'))) return;
            if (fileInput) fileInput.click();
        });
    }

    function optimizeSvg(svg) {
        var result = svg;

        // Remove XML declaration
        result = result.replace(/<\?xml[^?]*\?>/g, '');

        // Remove comments
        if (chkComments && chkComments.checked) {
            result = result.replace(/<!--[\s\S]*?-->/g, '');
        }

        // Remove metadata elements
        if (chkMetadata && chkMetadata.checked) {
            result = result.replace(/<metadata[\s\S]*?<\/metadata>/gi, '');
            result = result.replace(/<title>[\s\S]*?<\/title>/gi, '');
            result = result.replace(/<desc>[\s\S]*?<\/desc>/gi, '');
            result = result.replace(/<sodipodi:[^/]*\/>/gi, '');
            result = result.replace(/<sodipodi:[\s\S]*?<\/sodipodi:[^>]*>/gi, '');
            result = result.replace(/<inkscape:[^/]*\/>/gi, '');
            result = result.replace(/\s+inkscape:[a-z-]+="[^"]*"/g, '');
            result = result.replace(/\s+sodipodi:[a-z-]+="[^"]*"/g, '');
            result = result.replace(/\s+xmlns:inkscape="[^"]*"/g, '');
            result = result.replace(/\s+xmlns:sodipodi="[^"]*"/g, '');
            result = result.replace(/\s+xmlns:dc="[^"]*"/g, '');
            result = result.replace(/\s+xmlns:cc="[^"]*"/g, '');
            result = result.replace(/\s+xmlns:rdf="[^"]*"/g, '');
        }

        // Clean generated IDs (like id="path1234")
        if (chkCleanIds && chkCleanIds.checked) {
            result = result.replace(/\s+id="(path|rect|circle|ellipse|polygon|polyline|line|g)\d+"/g, '');
        }

        // Remove empty attributes
        if (chkEmptyAttrs && chkEmptyAttrs.checked) {
            result = result.replace(/\s+[a-zA-Z-]+=""\s*/g, ' ');
            result = result.replace(/\s+style=""\s*/g, ' ');
        }

        // Remove unnecessary whitespace between tags
        result = result.replace(/>\s+</g, '><');
        // Collapse multiple spaces
        result = result.replace(/\s{2,}/g, ' ');
        // Trim whitespace inside tags
        result = result.replace(/\s+>/g, '>');
        result = result.replace(/\s+\/>/g, '/>');

        // Remove empty groups
        if (chkMergePaths && chkMergePaths.checked) {
            result = result.replace(/<g>\s*<\/g>/g, '');
            result = result.replace(/<g\s+>\s*<\/g>/g, '');
        }

        return result.trim();
    }

    if (optimizeBtn) {
        optimizeBtn.addEventListener('click', function() {
            if (!originalSvg) return;

            optimizedSvg = optimizeSvg(originalSvg);

            var origBytes = new TextEncoder().encode(originalSvg).length;
            var newBytes = new TextEncoder().encode(optimizedSvg).length;
            var reduction = origBytes > 0 ? Math.round((1 - newBytes / origBytes) * 100) : 0;

            if (origSizeEl) origSizeEl.textContent = formatBytes(origBytes);
            if (newSizeEl) newSizeEl.textContent = formatBytes(newBytes);
            if (reductionEl) reductionEl.textContent = reduction + '%';

            if (beforeEl) beforeEl.innerHTML = sanitizeSvgForPreview(originalSvg);
            if (afterEl) afterEl.innerHTML = sanitizeSvgForPreview(optimizedSvg);

            if (settingsEl) settingsEl.style.display = 'none';
            if (resultEl) resultEl.style.display = 'flex';
        });
    }

    function sanitizeSvgForPreview(svg) {
        // Ensure the SVG has width/height constraints for preview
        return svg.replace(/<svg/, '<svg style="max-width:100%;max-height:100px;"');
    }

    if (downloadBtn) {
        downloadBtn.addEventListener('click', function() {
            if (!optimizedSvg) return;
            var blob = new Blob([optimizedSvg], {type: 'image/svg+xml'});
            var a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = currentFile ? currentFile.name.replace(/\.svg$/i, '-optimized.svg') : 'optimized.svg';
            a.click();
        });
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', function() {
            currentFile = null;
            originalSvg = '';
            optimizedSvg = '';
            if (fileInput) fileInput.value = '';
            if (dropZone) dropZone.style.display = 'flex';
            if (settingsEl) settingsEl.style.display = 'none';
            if (resultEl) resultEl.style.display = 'none';
            if (beforeEl) beforeEl.innerHTML = '';
            if (afterEl) afterEl.innerHTML = '';
        });
    }
})();

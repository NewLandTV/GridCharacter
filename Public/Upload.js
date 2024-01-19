function LoadImage(data) {
    if (data == null) return;

    let preview = document.getElementById("preview");
    let file = data.files[0];

    if (preview == null) {
        preview = document.createElement("img");

        preview.id = "preview";
        preview.style.width = "50%";
        preview.style.height = "50%";
        preview.style.objectFit = "cover";

        let container = document.getElementById("image-show");

        container.appendChild(preview);
    }

    preview.src = URL.createObjectURL(file);
}
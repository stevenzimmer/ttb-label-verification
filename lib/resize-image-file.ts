export const resizeImageFile = async (file: File, maxSize: number) => {
    const imageBitmap = await createImageBitmap(file);
    const scale = Math.min(
        1,
        maxSize / imageBitmap.width,
        maxSize / imageBitmap.height,
    );
    const targetWidth = Math.round(imageBitmap.width * scale);
    const targetHeight = Math.round(imageBitmap.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const context = canvas.getContext("2d");
    if (!context) {
        return file;
    }
    context.drawImage(imageBitmap, 0, 0, targetWidth, targetHeight);
    const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/jpeg", 0.8),
    );
    if (!blob) {
        return file;
    }
    return new File([blob], `${file.name.split(".")[0]}.jpg`, {
        type: "image/jpeg",
    });
};

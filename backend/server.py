from flask import Flask, request, send_file
import base64
import io
from PIL import Image

app = Flask(__name__)

@app.route("/export", methods=["POST"])
def export_plot():
    data_url = request.json.get("dataUrl")
    if not data_url.startswith("data:image/png;base64,"):
        return {"error": "Invalid image format."}, 400

    img_data = base64.b64decode(data_url.split(",")[1])
    image = Image.open(io.BytesIO(img_data))
    output = io.BytesIO()
    image.save(output, format="PNG")
    output.seek(0)
    return send_file(output, mimetype='image/png', download_name='graphexo_export.png')

if __name__ == "__main__":
    app.run(debug=True)

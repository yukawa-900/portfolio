import magic
from django.core.exceptions import ValidationError


def validate_photo(file):
    mime_type = magic.from_buffer(file.read(2048), mime=True)
    print(mime_type)
    if mime_type not in ["image/jpeg", "image/png"]:
        raise ValidationError('ファイルの形式を確認してください')

    if file.size > 3000000:  # 3000KB = 3MB
        print(f"ファイルサイズ: {file.size}")
        raise ValidationError('ファイルサイズが大きすぎます。最大300KBです。')

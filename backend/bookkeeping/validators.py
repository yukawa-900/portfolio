import magic
from django.core.exceptions import ValidationError


class PDFValidator:

    def __call__(self, value):
        mime_type = magic.from_buffer(value.read(1024), mime=True)
        if mime_type != 'application/pdf':
            raise ValidationError('PDF形式のファイルのみアップロード可能です')

        if value.size > 300000:  # 300KB
            print(f"ファイルサイズ: {value.size}")
            raise ValidationError('ファイルサイズが大きすぎます。最大300KBです。')

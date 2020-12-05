import magic
from django.core.exceptions import ValidationError


class PDFValidator:

    def __call__(self, value):
        mime_type = magic.from_buffer(value.read(1024), mime=True)
        if mime_type != 'application/pdf':
            raise ValidationError('PDF形式のファイルのみアップロード可能です')

        if value.size > 2**20:  # 1メガバイト
            print(value.size)
            print(2**20)
            raise ValidationError('ファイルサイズが大きすぎます。最大1MBです。')

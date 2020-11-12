# from allauth.account.adapter import DefaultAccountAdapter


# class AccountAdapter(DefaultAccountAdapter):

#     def save_user(self, request, user, form, commit=True):
#         """
#         This is called when saving user via allauth registration.
#         We override this to set additional data on user object.
#         """
#         # Do not persist the user yet so we pass commit=False
#         # (last argument)
#         user = super(AccountAdapter, self).save_user(request, user, form, commit=False)
#         user.age = form.cleaned_data.get('age')
#         user.weight = form.cleaned_data.get('weight')
#         user.save()
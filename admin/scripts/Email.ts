/**
 * 이 파일은 아이모듈 이메일모듈 일부입니다. (https://www.imodules.io)
 *
 * 관리자 UI 이벤트를 관리하는 클래스를 정의한다.
 *
 * @file /modules/email/admin/scripts/Email.ts
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2024. 5. 11.
 */
namespace modules {
    export namespace email {
        export namespace admin {
            export class Email extends modules.admin.admin.Component {
                /**
                 * 모듈 환경설정 폼을 가져온다.
                 *
                 * @return {Promise<Aui.Form.Panel>} configs
                 */
                async getConfigsForm(): Promise<Aui.Form.Panel> {
                    return new Aui.Form.Panel({
                        scrollable: true,
                        items: [
                            new Aui.Form.FieldSet({
                                title: (await this.getText('admin.configs.default')) as string,
                                items: [
                                    new AdminUi.Form.Field.Template({
                                        label: (await this.getText('admin.configs.template')) as string,
                                        name: 'template',
                                        allowBlank: false,
                                        componentType: this.getType(),
                                        componentName: this.getName(),
                                    }),
                                    new Aui.Form.Field.Container({
                                        items: [
                                            new Aui.Form.Field.Text({
                                                label: (await this.getText(
                                                    'admin.configs.default_from_address'
                                                )) as string,
                                                name: 'default_from_address',
                                                allowBlank: false,
                                                flex: 1,
                                            }),
                                            new Aui.Form.Field.Text({
                                                label: (await this.getText(
                                                    'admin.configs.default_from_name'
                                                )) as string,
                                                name: 'default_from_name',
                                                allowBlank: false,
                                                flex: 1,
                                            }),
                                        ],
                                    }),
                                ],
                            }),
                            new Aui.Form.FieldSet({
                                title: (await this.getText('admin.configs.smtp')) as string,
                                items: [
                                    new Aui.Form.Field.Text({
                                        label: (await this.getText('admin.configs.smtp_host')) as string,
                                        name: 'smtp_host',
                                        allowBlank: false,
                                        flex: 1,
                                    }),
                                    new Aui.Form.Field.Container({
                                        items: [
                                            new Aui.Form.Field.Text({
                                                label: (await this.getText('admin.configs.smtp_port')) as string,
                                                name: 'smtp_port',
                                                allowBlank: false,
                                                flex: 1,
                                            }),
                                            new Aui.Form.Field.Select({
                                                label: (await this.getText('admin.configs.smtp_secure')) as string,
                                                name: 'smtp_secure',
                                                store: new Aui.Store.Local({
                                                    fields: ['value'],
                                                    records: [['NONE'], ['TLS'], ['SSL']],
                                                }),
                                                displayField: 'value',
                                                valueField: 'value',
                                                allowBlank: false,
                                                flex: 1,
                                            }),
                                        ],
                                    }),
                                    new Aui.Form.Field.Container({
                                        label: (await this.getText('admin.configs.smtp_auth')) as string,
                                        direction: 'column',
                                        items: [
                                            new Aui.Form.Field.Check({
                                                name: 'smtp_auth',
                                                boxLabel: (await this.getText(
                                                    'admin.configs.smtp_auth_help'
                                                )) as string,
                                                listeners: {
                                                    change: (field, value) => {
                                                        const form = field.getForm();
                                                        form.getField('smtp_id').setDisabled(!value);
                                                        form.getField('smtp_password').setDisabled(!value);
                                                    },
                                                },
                                            }),
                                            new Aui.Form.FieldSet({
                                                title: (await this.getText('admin.configs.smtp_auth_info')) as string,
                                                items: [
                                                    new Aui.Form.Field.Text({
                                                        label: (await this.getText('admin.configs.smtp_id')) as string,
                                                        name: 'smtp_id',
                                                        allowBlank: false,
                                                        flex: 1,
                                                        disabled: true,
                                                    }),
                                                    new Aui.Form.Field.Text({
                                                        label: (await this.getText(
                                                            'admin.configs.smtp_password'
                                                        )) as string,
                                                        name: 'smtp_password',
                                                        allowBlank: false,
                                                        flex: 1,
                                                        disabled: true,
                                                    }),
                                                ],
                                            }),
                                        ],
                                    }),
                                ],
                            }),
                        ],
                        listeners: {
                            load: (form, response) => {
                                if (
                                    (response?.data?.smtp_id ?? null) !== null &&
                                    (response?.data?.smtp_password ?? null) !== null
                                ) {
                                    form.getField('smtp_auth').setValue(true);
                                }
                            },
                        },
                    });
                }

                /**
                 * 발송/수신자명을 가져온다.
                 *
                 */
                getMemberName(member): string {
                    return (
                        '<i class="photo" style="background-image:url(' +
                        member.photo +
                        ')"></i>' +
                        member.name +
                        ' &lt;' +
                        member.address +
                        '&gt;'
                    );
                }
            }
        }
    }
}

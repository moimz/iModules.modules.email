/**
 * 이 파일은 아이모듈 이메일모듈 일부입니다. (https://www.imodules.io)
 *
 * 이메일 발송 내역 화면을 구성한다.
 *
 * @file /modules/email/admin/scripts/contexts/messages.ts
 * @author pbj <ju318@ubion.co.kr>
 * @license MIT License
 * @modified 2024. 10. 18.
 *
 */

Admin.ready(async () => {
    const me = Admin.getModule('email') as modules.email.admin.Email;

    return new Aui.Panel({
        id: 'messages',
        title: (await me.getText('admin.contexts.messages')) as string,
        iconClass: 'mi mi-message-dots',
        layout: 'column',
        border: false,
        topbar: [
            new Aui.Form.Field.Search({
                id: 'keyword',
                width: 200,
                emptyText: '수신자',
                handler: async (keyword) => {
                    const context = Aui.getComponent('messages') as Aui.Tab.Panel;
                    const messages = context.getItemAt(0) as Aui.Grid.Panel;
                    if (keyword.length > 0) {
                        messages.getStore().setParam('keyword', keyword);
                    } else {
                        messages.getStore().setParam('keyword', null);
                    }
                    messages.getStore().loadPage(1);
                },
            }),
        ],
        items: [
            new Aui.Grid.Panel({
                border: false,
                flex: 1,
                selection: { selectable: true, type: 'column', cancelable: true },
                autoLoad: false,
                freeze: 1,
                bottombar: new Aui.Grid.Pagination([
                    new Aui.Button({
                        iconClass: 'mi mi-refresh',
                        handler: (button) => {
                            const grid = button.getParent().getParent() as Aui.Grid.Panel;
                            grid.getStore().reload();
                        },
                    }),
                ]),
                columns: [
                    {
                        text: (await me.getText('admin.messages.columns.title')) as string,
                        dataIndex: 'title',
                        selectable: true,
                        sortable: true,
                        minWidth: 300,
                        flex: 1,
                    },
                    {
                        text: '발송자',
                        dataIndex: 'sended_by',
                        width: 260,
                        renderer: (value, record) => {
                            return me.getMemberName(value);
                        },
                    },
                    {
                        text: '수신자',
                        dataIndex: 'member_by',
                        width: 260,
                        renderer: (value, record) => {
                            return me.getMemberName(value);
                        },
                    },
                    {
                        text: '보낸시간',
                        dataIndex: 'sended_at',
                        width: 150,
                        sortable: true,
                        filter: new Aui.Grid.Filter.Date({
                            format: 'timestamp',
                        }),
                        renderer: (value) => {
                            return Format.date('Y.m.d(D) H:i', value);
                        },
                    },
                    {
                        text: '확인시간',
                        dataIndex: 'checked_at',
                        width: 150,
                        sortable: true,
                        filter: new Aui.Grid.Filter.Date({
                            format: 'timestamp',
                        }),
                        renderer: (value) => {
                            if (value != undefined) {
                                return Format.date('Y.m.d(D) H:i', value);
                            } else {
                                return '';
                            }
                        },
                    },
                    {
                        text: '발송상태',
                        dataIndex: 'status',
                        width: 100,
                        sortable: true,
                        filter: new Aui.Grid.Filter.List({
                            dataIndex: 'status',
                            store: new Aui.Store.Local({
                                fields: ['display', { name: 'value', type: 'string' }],
                                records: [
                                    ['성공', 'TRUE'],
                                    ['실패', 'FALSE'],
                                ],
                            }),
                            displayField: 'display',
                            valueField: 'value',
                        }),
                        renderer: (value) => {
                            const statuses = {
                                'TRUE': '<span class="success">성공</span>',
                                'FALSE': '<span class="fail">실패</span>',
                            };
                            return statuses[value];
                        },
                    },
                ],
                store: new Aui.Store.Remote({
                    url: me.getProcessUrl('messages'),
                    primaryKeys: ['message_id'],
                    limit: 50,
                    sorters: { sended_at: 'DESC' },
                    remoteSort: true,
                    remoteFilter: true,
                }),
                listeners: {
                    render: async (grid: Aui.Grid.Panel) => {
                        const message_id = Admin.getContextSubUrl(0);
                        if (message_id !== null) {
                            const results = await Ajax.get(me.getProcessUrl('messages'), {
                                ...(await grid.getStore().getLoaderParams()),
                                message_id: message_id,
                            });
                            if (results.success == true) {
                                if (results.page == -1) {
                                    grid.getStore().load();
                                } else {
                                    grid.getStore().loadPage(results.page);
                                }
                            }
                        }
                        if (grid.getStore().isLoaded() == false) {
                            grid.getStore().load();
                        }
                    },
                    update: (grid) => {
                        if (Admin.getContextSubUrl(0) !== null && grid.getSelections().length == 0) {
                            grid.select({ message_id: Admin.getContextSubUrl(0) });
                        }
                    },
                    selectionChange: (selection, grid) => {
                        const detail = grid.getParent().getItemAt(1) as Aui.Panel;

                        if (selection.length == 0) {
                            detail.hide();
                        } else {
                            const record = selection[0];
                            detail.properties.update(detail, record);
                            detail.show();
                        }

                        if (grid.getStore().isLoaded() == true && grid.getSelections().length !== 0) {
                            const record = grid.getSelections()[0];
                            if (Admin.getContextSubUrl(1) !== record.get('message_id')) {
                                Admin.setContextSubUrl('/' + record.get('message_id'));
                            }
                        }
                    },
                },
            }),
            new Aui.Panel({
                width: 540, // 템플릿에 따라 다를 여지가 있음.
                hidden: true,
                border: [false, false, false, true],
                resizable: [false, false, false, true],
                title: new Aui.Title({
                    text: 'Loading...',
                    tools: [],
                }),
                items: [
                    new Aui.Panel({
                        border: false,
                        scrollable: true,
                        layout: 'fit',
                        html: '<div data-role="massage"></div>',
                    }),
                ],
                update: async (panel: Aui.Panel, record: Aui.Data.Record) => {
                    const results = await Ajax.get(me.getProcessUrl('message'), {
                        message_id: record.get('message_id'),
                    });
                    panel.getTitle().setTitle(record.get('title'));

                    const content = panel.getItemAt(0) as Aui.Panel;
                    if (content.isRendered() == false) {
                        content.render();
                    }
                    const $massage = Html.get('div[data-role=massage]', content.$getContent());
                    $massage.html(String(results.data));
                },
            }),
        ],
    });
});
